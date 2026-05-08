export default function DataTable({ columns, data, entity}) {
  return (
    <div className="theme-panel overflow-x-auto overflow-y-visible rounded-2xl border">

      <table className="theme-muted w-full text-left text-sm">

        <thead className="theme-surface theme-muted text-xs uppercase tracking-wide">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data?.length > 0 ? (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-t border-gray-800 hover:bg-white/5 transition-all"
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4">
                    
                    {col.render ? (
                      col.render(row)
                    ) : col.accessor === "name" ? (
                      <div className="flex flex-col">
                        <span className="theme-text">{row.name}</span>
                        <span className="theme-soft text-xs">{row.email}</span>
                      </div>
                    ) : col.accessor === "status" ? (
                      <span className={`px-2 py-1 rounded text-xs
                        ${row.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"}`}>
                        {row.status}
                      </span>
                    ) : (
                      row[col.accessor]
                    )}

                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="theme-soft py-12 text-center">
                No {entity} found
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
}
