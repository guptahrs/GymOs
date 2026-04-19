export default function DataTable({ columns, data }) {
  return (
    <div className="bg-card rounded-2xl border border-gray-800 overflow-hidden">

      <table className="w-full text-sm text-left text-gray-300">

        {/* Header */}
        <thead className="bg-[#0B1220] text-gray-400 text-xs uppercase tracking-wide">
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
                    
                    {col.accessor === "name" ? (
                      <div className="flex flex-col">
                        <span className="text-white">{row.name}</span>
                        <span className="text-xs text-gray-500">{row.email}</span>
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
              <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                No members found
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
}