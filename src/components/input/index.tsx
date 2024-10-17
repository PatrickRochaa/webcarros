import { RegisterOptions, UseFormRegister } from "react-hook-form";

//interface para configurar o recebimento
//das propriedades do input
interface InputProps {
  type: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<any>;
  error?: string;
  rules?: RegisterOptions;
}

export function Input({
  type,
  placeholder,
  name,
  register,
  error,
  rules,
}: InputProps) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name, rules)}
        id={name}
        className="w-full border-2 rounded-md h-11 px-2 outline-none"
      />
      {error && <p className="text-red-500 my-1">{error}</p>}
    </div>
  );
}
