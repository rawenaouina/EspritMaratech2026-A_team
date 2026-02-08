export default function Pagination({ page, pages, setPage }) {
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button className="px-3 py-2 rounded-xl border" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Prev
      </button>
      <div className="text-sm">Page {page} / {pages}</div>
      <button className="px-3 py-2 rounded-xl border" disabled={page >= pages} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
