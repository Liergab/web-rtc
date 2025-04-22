/**
 * Tailwind CSS class merging utility
 * This helps us combine Tailwind classes and conditionally apply them
 */

/**
 * Combines multiple class strings and removes duplicates
 * @param {...string} classes - The classes to combine
 * @returns {string} - The combined class string
 */
export function twMerge(...classes: (string | undefined | null | false)[]): string {
  // Filter out falsy values
  return classes.filter(Boolean).join(' ').trim().replace(/\s+/g, ' '); // Replace multiple spaces with a single space
}

/**
 * Conditionally apply classes
 * @param {Record<string, boolean>} classMap - Object where keys are class strings and values are conditions
 * @returns {string} - The combined class string with only classes whose conditions are true
 */
export function twCond(classMap: Record<string, boolean>): string {
  return Object.entries(classMap)
    .filter(([_, condition]) => condition)
    .map(([className]) => className)
    .join(' ');
}

/**
 * Combines the functionality of both twMerge and twCond
 * @param {...(string | undefined | null | false | Record<string, boolean>)} args - Classes or condition maps
 * @returns {string} - The combined class string
 */
export function tw(
  ...args: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  const processedArgs = args.map(arg => {
    if (arg && typeof arg === 'object') {
      return twCond(arg as Record<string, boolean>);
    }
    return arg as string | undefined | null | false;
  });

  return twMerge(...(processedArgs as (string | undefined | null | false)[]));
}
