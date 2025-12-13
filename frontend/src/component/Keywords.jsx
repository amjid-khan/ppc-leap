import React from "react";
import { Key, Plus } from "lucide-react";

const Keywords = () => {
  return (
    // premium card section
    <div className="mb-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg">
                <Key className="text-black dark:text-white" size={26} />
              </div>

              <h1 className="text-3xl font-bold text-black dark:text-white">
                Keywords
              </h1>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
              Manage and optimize your keywords
            </p>
          </div>

          {/* Right Section - Add Keyword Button */}
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            <Plus size={16} />
            Add Keyword
          </button>
        </div>
      </div>
    </div>
  );
};

export default Keywords;
