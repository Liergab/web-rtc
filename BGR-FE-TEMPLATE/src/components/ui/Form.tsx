import React, { createContext, useContext, useId } from 'react';

interface FormFieldContextValue {
  name: string;
  id: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
}

const FormFieldContext = createContext<FormFieldContextValue | undefined>(undefined);

function useFormField() {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error('useFormField must be used within a FormField');
  }
  return context;
}

interface FormItemContextValue {
  id: string;
}

const FormItemContext = createContext<FormItemContextValue | undefined>(undefined);

function useFormItem() {
  const context = useContext(FormItemContext);
  if (!context) {
    throw new Error('useFormItem must be used within a FormItem');
  }
  return context;
}

interface FormFieldProps {
  name: string;
  children: React.ReactNode;
}

export function FormField({ name, children }: FormFieldProps) {
  const id = useId();
  const formItemId = `${id}-form-item`;
  const formDescriptionId = `${id}-form-item-description`;
  const formMessageId = `${id}-form-item-message`;

  return (
    <FormFieldContext.Provider
      value={{
        name,
        id,
        formItemId,
        formDescriptionId,
        formMessageId,
      }}
    >
      {children}
    </FormFieldContext.Provider>
  );
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function FormItem({ className = '', children, ...props }: FormItemProps) {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={`space-y-2 ${className}`} {...props}>
        {children}
      </div>
    </FormItemContext.Provider>
  );
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children: React.ReactNode;
}

export function FormLabel({ className = '', children, ...props }: FormLabelProps) {
  const { formItemId } = useFormField();
  
  return (
    <label
      htmlFor={formItemId}
      className={`block text-sm font-medium text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormControl({ children, ...props }: FormControlProps) {
  const { formItemId, formDescriptionId, formMessageId } = useFormField();

  return React.cloneElement(children as React.ReactElement, {
    id: formItemId,
    'aria-describedby': formDescriptionId,
    'aria-invalid': formMessageId ? true : undefined,
    ...props,
  });
}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export function FormDescription({ className = '', children, ...props }: FormDescriptionProps) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: React.ReactNode;
}

export function FormMessage({ className = '', children, ...props }: FormMessageProps) {
  const { formMessageId } = useFormField();

  return (
    <p
      id={formMessageId}
      className={`text-sm font-medium text-red-500 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  className?: string;
  children: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export function Form({ className = '', children, onSubmit, ...props }: FormProps) {
  return (
    <form
      className={`space-y-6 ${className}`}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
} 