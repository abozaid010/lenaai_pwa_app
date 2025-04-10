import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../utils/GlobalState';

const ClientIdInput: React.FC = () => {
  const { clientId, setClientId } = useGlobalState();
  const [inputValue, setInputValue] = useState(clientId);

  useEffect(() => {
    setInputValue(clientId);
  }, [clientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientId(inputValue);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      
        <div className="flex gap-2">
          <input
            type="text"
            id="clientId"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
            placeholder="Enter Client ID"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Set
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientIdInput; 