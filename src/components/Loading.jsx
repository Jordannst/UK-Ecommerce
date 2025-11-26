const Loading = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-unklab-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-unklab-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;


