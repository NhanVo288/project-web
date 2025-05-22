import React from 'react';
const Form = ({ fields, onSubmit, initialValues = {}, submitLabel = 'Submit' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {};
    fields.forEach((field) => {
      formData[field.name] = e.target[field.name].value;
    });
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700"
          >
            {field.label}
          </label>
          <div className="mt-1">
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={field.rows || 3}
                defaultValue={initialValues[field.name] || ''}
                required={field.required}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                defaultValue={initialValues[field.name] || ''}
                required={field.required}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                name={field.name}
                id={field.name}
                defaultValue={initialValues[field.name] || ''}
                required={field.required}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            )}
          </div>
          {field.helpText && (
            <p className="mt-2 text-sm text-gray-500">{field.helpText}</p>
          )}
        </div>
      ))}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default Form; 
