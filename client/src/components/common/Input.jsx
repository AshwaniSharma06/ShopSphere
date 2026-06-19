export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  required,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-bold text-mist dark:text-mist uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-crimson ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke pointer-events-none" />
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-field ${Icon ? 'pl-10' : ''} ${error ? '!border-crimson focus:!ring-crimson/20 focus:!border-crimson' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-crimson-bright">{error}</p>
      )}
    </div>
  );
}
