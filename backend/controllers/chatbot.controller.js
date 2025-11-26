import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../utils/prisma.js';
import axios from 'axios';

// Get Gemini API configuration from environment variables
// Note: dotenv.config() is already called in server.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash"; // Default to fast flash model

// Initialize Gemini AI
let genAI = null;

// Cache for available models (refresh every hour)
let cachedModels = null;
let modelsCacheTime = null;
const MODELS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== "") {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Pre-load available models cache
    listAvailableModels().catch(() => {
      // Silent fail - will retry on first request
    });
  } catch (error) {
    console.error('❌ Error initializing Gemini AI:', error.message);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY belum dikonfigurasi di file .env');
}

// Function to prioritize models (flash models are faster, prioritize stable versions)
function prioritizeModels(models) {
  if (!models || models.length === 0) return [];
  
  // Priority order: stable flash models first (faster), then pro models
  const priorityOrder = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.0-flash-001',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.0-pro-exp',
    'gemini-pro-latest',
  ];
  
  const prioritized = [];
  const others = [];
  
  // Add prioritized models first
  for (const priority of priorityOrder) {
    if (models.includes(priority)) {
      prioritized.push(priority);
    }
  }
  
  // Add other models
  for (const model of models) {
    if (!prioritized.includes(model)) {
      others.push(model);
    }
  }
  
  return [...prioritized, ...others];
}

// Function to list available models using REST API (with caching)
async function listAvailableModels(forceRefresh = false) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "") return null;
  
  // Return cached models if still valid
  if (!forceRefresh && cachedModels && modelsCacheTime) {
    const now = Date.now();
    if (now - modelsCacheTime < MODELS_CACHE_DURATION) {
      return cachedModels;
    }
  }
  
  try {
    // Try to list models using REST API
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      { timeout: 10000 }
    );
    
    if (response.data && response.data.models) {
      const modelNames = response.data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''))
        .sort();
      
      // Prioritize models and cache
      const prioritizedModels = prioritizeModels(modelNames);
      cachedModels = prioritizedModels;
      modelsCacheTime = Date.now();
      
      return prioritizedModels;
    }
  } catch (error) {
    // Silent fail - will use fallback models
  }
  
  return cachedModels || null; // Return cached if available, even if expired
}

// Get chatbot response
export const getChatbotResponse = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Pesan tidak boleh kosong',
      });
    }

    // Get products and categories for context
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        take: 50, // Limit untuk context
      }),
      prisma.category.findMany(),
    ]);

    // Format products data for context
    const productsContext = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || 'Unknown',
      image: product.image,
    }));

    const categoriesContext = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
    }));

    // Build context for Gemini
    const systemContext = `Anda adalah asisten virtual yang membantu pelanggan di Starg, sebuah platform e-commerce.

INFORMASI TOKO:
- Nama: Starg
- Platform e-commerce modern
- Menjual berbagai produk berkualitas termasuk apparel, stationery, food & beverage, dan accessories

KATEGORI PRODUK YANG TERSEDIA:
${categoriesContext.map((cat) => `- ${cat.name}${cat.description ? `: ${cat.description}` : ''}`).join('\n')}

DAFTAR PRODUK YANG TERSEDIA:
${productsContext.map((p) => `- ${p.name} (ID: ${p.id}): ${p.description.substring(0, 100)}... Harga: Rp ${p.price.toLocaleString('id-ID')}, Stok: ${p.stock} unit, Kategori: ${p.category}`).join('\n')}

PETUNJUK:
1. Jawab dengan ramah dan profesional dalam bahasa Indonesia
2. Gunakan informasi produk di atas untuk menjawab pertanyaan tentang produk
3. Jika ditanya tentang produk spesifik, berikan informasi lengkap (nama, harga, stok, deskripsi)
4. Jika ditanya tentang kategori, sebutkan produk-produk dalam kategori tersebut
5. Jika tidak yakin tentang informasi, sarankan untuk melihat halaman Shop
6. Jangan membuat informasi produk yang tidak ada dalam daftar
7. Format harga selalu dalam Rupiah (Rp)
8. Jika stok 0, katakan produk sedang tidak tersedia

Jawab pertanyaan pelanggan dengan ramah dan informatif.`;

    // Check if Gemini API key is configured
    if (!genAI || !GEMINI_API_KEY || GEMINI_API_KEY.trim() === "") {
      // Simple fallback response based on keywords
      const lowerMessage = message.toLowerCase();
      let fallbackResponse = '';
      
      if (lowerMessage.includes('harga') || lowerMessage.includes('berapa')) {
        fallbackResponse = 'Untuk informasi harga produk, silakan kunjungi halaman Shop atau lihat detail produk. Jika Anda ingin tahu harga produk tertentu, sebutkan nama produknya.';
      } else if (lowerMessage.includes('stok') || lowerMessage.includes('tersedia')) {
        fallbackResponse = 'Untuk informasi ketersediaan stok, silakan cek di halaman detail produk atau hubungi customer service kami.';
      } else if (lowerMessage.includes('produk') || lowerMessage.includes('barang')) {
        fallbackResponse = `Kami memiliki berbagai produk berkualitas di Starg. Silakan kunjungi halaman Shop untuk melihat semua produk yang tersedia, termasuk apparel, stationery, food & beverage, dan accessories.`;
      } else {
        fallbackResponse = 'Maaf, fitur chatbot AI sedang dalam maintenance. Silakan kunjungi halaman Shop untuk melihat produk atau hubungi customer service untuk bantuan lebih lanjut.';
      }
      
      return res.json({
        success: true,
        data: {
          message: fallbackResponse,
          timestamp: new Date(),
        },
      });
    }

    // Validate API key format
    if (GEMINI_API_KEY.length < 20) {
      console.error('❌ GEMINI_API_KEY tampaknya tidak valid (terlalu pendek)');
      throw new Error('Invalid API key format');
    }

    // Build conversation history for context
    const historyText = conversationHistory
      .slice(-6) // Ambil 6 pesan terakhir untuk context
      .map((msg) => {
        if (msg.sender === 'user') {
          return `User: ${msg.text}`;
        } else {
          return `Assistant: ${msg.text}`;
        }
      })
      .join('\n');

    const fullPrompt = `${systemContext}

${historyText ? `RIWAYAT PERCAKAPAN:\n${historyText}\n\n` : ''}PERTANYAAN PELANGGAN: ${message}

JAWABAN ANDA:`;

    // Try using REST API directly if SDK models fail
    // This is a fallback approach
    let responseText = null;
    let lastError = null;
    
    // First, try to get available models
    let availableModels = null;
    try {
      availableModels = await listAvailableModels();
    } catch (err) {
      // Silent fail - will use fallback models
    }
    
    // Build list of models to try
    // If we got available models, prioritize those
    let modelsToTry = [];
    
    if (availableModels && availableModels.length > 0) {
      // Use available models first
      modelsToTry = [...availableModels];
    } else {
      // Fallback to common model names
      modelsToTry = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash',
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro-001',
        'gemini-1.5-pro',
        'gemini-pro',
        GEMINI_MODEL, // User configured model
      ].filter((m, i, arr) => m && arr.indexOf(m) === i); // Remove duplicates
    }
    
    // Try each model until one works
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Generate response with timeout
        const generatePromise = model.generateContent(fullPrompt);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        );

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const response = await result.response;
        responseText = response.text();

        break; // Success! Exit loop
      } catch (modelError) {
        lastError = modelError;
        
        // If it's a 404 (model not found), try next model
        if (modelError.status === 404 || modelError.message?.includes('404') || modelError.message?.includes('not found')) {
          continue; // Try next model
        } else {
          // For other errors (quota, auth, etc), break and show error
          break;
        }
      }
    }
    
    // If SDK models all failed, try direct REST API call with v1 (not v1beta)
    if (!responseText && (lastError?.status === 404 || !lastError)) {
      // Try different API versions and models
      const restApiModels = availableModels || [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash',
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro-001',
        'gemini-1.5-pro',
        'gemini-pro',
      ];
      
      const restApiOptions = [];
      for (const model of restApiModels) {
        restApiOptions.push(
          { version: 'v1beta', model: model },
          { version: 'v1', model: model },
          { version: 'v1beta', model: `models/${model}` },
          { version: 'v1', model: `models/${model}` }
        );
      }
      
      for (const option of restApiOptions) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/${option.version}/models/${option.model}:generateContent?key=${GEMINI_API_KEY}`;
          
          const restResponse = await axios.post(apiUrl, {
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }]
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000 // 30 seconds timeout
          });

          if (restResponse.data && restResponse.data.candidates && restResponse.data.candidates[0] && restResponse.data.candidates[0].content) {
            responseText = restResponse.data.candidates[0].content.parts[0].text;
            break;
          }
        } catch (restError) {
          const status = restError.response?.status;
          
          if (status && status !== 404) {
            // If not 404, this might be auth/quota error, stop trying
            lastError = restError;
            break;
          }
          continue;
        }
      }
    }
    
    // If we got a response, return it
    if (responseText) {
      return res.json({
        success: true,
        data: {
          message: responseText,
          timestamp: new Date(),
        },
      });
    }
    
    // If no model worked, handle the error
    if (lastError) {
      // Handle specific Gemini API errors
      let errorMessage = 'Maaf, terjadi kesalahan saat memproses pertanyaan Anda.';
      
      if (lastError.message?.includes('API_KEY_INVALID') || lastError.message?.includes('401')) {
        errorMessage = '⚠️ API key Gemini tidak valid. Silakan periksa GEMINI_API_KEY di file backend/.env.';
      } else if (lastError.message?.includes('QUOTA_EXCEEDED') || lastError.message?.includes('429')) {
        errorMessage = '⚠️ Quota API Gemini telah habis. Silakan cek quota Anda di Google AI Studio.';
      } else if (lastError.message?.includes('timeout')) {
        errorMessage = '⚠️ Request ke Gemini API timeout. Silakan coba lagi.';
      } else if (lastError.message?.includes('403')) {
        errorMessage = '⚠️ Akses ke Gemini API ditolak. Pastikan API key memiliki izin yang cukup.';
      } else if (lastError.message?.includes('404') || lastError.message?.includes('not found')) {
        errorMessage = `⚠️ Semua model Gemini yang dicoba tidak tersedia untuk API key Anda.\n\n` +
          `📝 Model yang sudah dicoba: ${modelsToTry.join(', ')}\n\n` +
          `💡 Solusi:\n` +
          `1. Cek model yang tersedia di Google AI Studio: https://makersuite.google.com/app/apikey\n` +
          `2. Pastikan API key Anda memiliki akses ke model Gemini\n` +
          `3. Coba ubah GEMINI_MODEL di file backend/.env dengan model yang tersedia\n` +
          `4. Verifikasi API key valid dan memiliki quota yang cukup\n` +
          `5. Restart backend server setelah perubahan`;
      }

      // Fallback response dengan informasi produk jika memungkinkan
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('produk') || lowerMessage.includes('barang')) {
        const productList = products.slice(0, 5).map(p => `- ${p.name} (Rp ${p.price.toLocaleString('id-ID')})`).join('\n');
        errorMessage += `\n\nBerikut beberapa produk yang tersedia:\n${productList}\n\nSilakan kunjungi halaman Shop untuk melihat semua produk.`;
      }

      return res.json({
        success: true,
        data: {
          message: errorMessage,
          timestamp: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('❌ Error generating chatbot response:', error);
    console.error('Error stack:', error.stack);

    // Fallback response jika terjadi error umum
    const fallbackResponse = `Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi atau kunjungi halaman Shop untuk melihat produk yang tersedia.\n\nJika masalah berlanjut, pastikan:\n1. GEMINI_API_KEY sudah dikonfigurasi di file backend/.env\n2. API key valid dan memiliki quota yang cukup\n3. Koneksi internet stabil`;

    res.json({
      success: true,
      data: {
        message: fallbackResponse,
        timestamp: new Date(),
      },
    });
  }
};

// Get initial greeting message
export const getInitialMessage = async (req, res, next) => {
  try {
    const initialMessage = {
      id: 1,
      text: 'Halo! 👋 Saya adalah asisten virtual Starg. Saya bisa membantu Anda mencari produk, memberikan informasi tentang produk, atau menjawab pertanyaan tentang toko kami. Ada yang bisa saya bantu?',
      sender: 'bot',
      timestamp: new Date(),
    };

    res.json({
      success: true,
      data: initialMessage,
    });
  } catch (error) {
    next(error);
  }
};