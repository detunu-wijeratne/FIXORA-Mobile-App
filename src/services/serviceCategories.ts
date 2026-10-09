/** Customer and provider screens use different labels for the same AC trade. */
export const normalizeServiceCategory = (category: string) => {
  const normalized = category.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized === "ac repair" ? "ac service" : normalized;
};

export const matchesServiceCategory = (
  selectedCategory: string,
  primaryCategory: string | undefined,
  additionalCategories: string[] = [],
) => {
  const selected = normalizeServiceCategory(selectedCategory);
  return !selected || [primaryCategory || "", ...additionalCategories].some(
    (category) => normalizeServiceCategory(category) === selected,
  );
};
