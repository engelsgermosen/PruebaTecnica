const Input = ({ name, label, type, placeholder, value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 font-medium"
      />
    </div>
  );
};

export default Input;
