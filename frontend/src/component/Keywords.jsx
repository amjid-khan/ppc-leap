import React, { useState } from "react";
import { Key, Plus, X } from "lucide-react";
import KeywordList from "./KeywordList";

const Keywords = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  return (
    <>
      {/* Premium Card Section */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-green-500 dark:bg-green-800 p-2.5 rounded-lg">
                  <Key className="text-white dark:text-white" size={26} />
                </div>

                <h1 className="text-2xl font-bold text-black dark:text-white">
                  Keywords
                </h1>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                Manage and optimize your keywords
              </p>
            </div>

            {/* Right Section - Add Keyword Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              <Plus size={16} />
              Add Keyword
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md p-5 border border-gray-300 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Add Keyword
              </h2>

              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-gray-500 hover:text-gray-700" size={20} />
              </button>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Enter keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  console.log(keyword);
                  setIsModalOpen(false);
                  setKeyword("");
                }}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <KeywordList keyword={keyword} />
    </>
  );
};

export default Keywords;
