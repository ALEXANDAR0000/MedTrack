import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export default function AdminDataTable({
  title,
  data,
  columns,
  selectedItem,
  onSelectItem,
  onDelete,
  addPath,
  updatePath,
  entityName,
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter((item) =>
      columns.some((column) => {
        const value = item[column.key];
        if (value === null || value === undefined) return false;
        return value
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    );
  }, [data, columns, searchTerm]);

  const formatCellValue = (item, column) => {
    let value = item[column.key];

    if (column.format) {
      return column.format(value);
    }

    if (column.key === "date_of_birth" && value) {
      return value.split("T")[0];
    }

    if (column.key === "gender" && value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return value || "";
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="title text-center mb-6">{title}</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
            onClick={() => navigate(addPath)}
          >
            Add {entityName}
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!selectedItem}
            onClick={() =>
              navigate(updatePath.replace(":id", selectedItem?.id))
            }
          >
            Update
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!selectedItem}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="search"
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width || "min-w-[120px]"
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500 italic"
                >
                  {searchTerm
                    ? `No ${title.toLowerCase()} found matching "${searchTerm}"`
                    : `No ${title.toLowerCase()} available`}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-sm relative ${
                    selectedItem?.id === item.id
                      ? "bg-blue-100 shadow-sm"
                      : ""
                  }`}
                  style={{
                    borderLeft: selectedItem?.id === item.id 
                      ? "4px solid rgb(59 130 246)" 
                      : "4px solid transparent"
                  }}
                  onClick={() => onSelectItem(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 text-sm ${
                        column.key === "first_name" ||
                        column.key === "last_name"
                          ? "font-medium text-gray-900"
                          : "text-gray-700"
                      } ${column.className || ""}`}
                    >
                      {formatCellValue(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredData.length} of {data.length} {title.toLowerCase()}
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </div>
      )}
    </div>
  );
}

AdminDataTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      width: PropTypes.string,
      className: PropTypes.string,
      format: PropTypes.func,
    })
  ).isRequired,
  selectedItem: PropTypes.object,
  onSelectItem: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  addPath: PropTypes.string.isRequired,
  updatePath: PropTypes.string.isRequired,
  entityName: PropTypes.string.isRequired,
};
