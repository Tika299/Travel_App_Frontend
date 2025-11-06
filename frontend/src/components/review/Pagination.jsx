export const Pagination = ({ page, setPage, lastPage }) => {
  const getPagination = () => {
    const pages = [];

    if (lastPage <= 7) {
      // Trường hợp ít page, hiển thị tất cả
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1); // Trang đầu

      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(lastPage - 1, page + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (page < lastPage - 2) pages.push("...");

      pages.push(lastPage); // Trang cuối
    }

    return pages;
  };

  const paginationItems = getPagination();

  return (
    <div className="flex justify-center items-center gap-2 my-4 flex-wrap">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className={`px-3 py-1 rounded-lg text-sm font-medium ${
          page === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        ← Trang trước
      </button>

      {paginationItems.map((item, idx) =>
        item === "..." ? (
          <span key={idx} className="px-2 text-gray-500 text-sm">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => setPage(item)}
            className={`px-3 py-1 rounded text-sm ${
              item === page
                ? "bg-blue-700 text-white font-bold"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        disabled={page === lastPage}
        onClick={() => setPage(page + 1)}
        className={`px-3 py-1 rounded-lg text-sm font-medium ${
          page === lastPage
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Trang sau →
      </button>
    </div>
  );
};
