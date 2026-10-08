import { categoryRepository, serviceRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { nowIso } from '../utils/time.js';

export const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const byOrderThenName = (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name);

/** BR-4: the public list only contains active categories. */
export async function listCategories({ includeInactive = false } = {}) {
  const categories = await categoryRepository.findAll({ activeOnly: !includeInactive });
  return categories.sort(byOrderThenName);
}

export async function getCategory(id) {
  const category = await categoryRepository.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
}

/** Returns the category only when it exists and is active — used by search & booking. */
export async function getActiveCategory(id) {
  const category = await categoryRepository.findById(id);
  return category && category.active ? category : null;
}

async function assertUniqueSlug(slug, exceptId) {
  const existing = await categoryRepository.findBySlug(slug);
  if (existing && existing.id !== exceptId) throw ApiError.conflict('A category with this name already exists');
}

export async function createCategory(data) {
  const slug = slugify(data.name);
  await assertUniqueSlug(slug);
  const timestamp = nowIso();
  return categoryRepository.create({ ...data, slug, sortOrder: 999, createdAt: timestamp, updatedAt: timestamp });
}

export async function updateCategory(id, changes) {
  await getCategory(id);
  const update = { ...changes, updatedAt: nowIso() };
  if (changes.name) {
    update.slug = slugify(changes.name);
    await assertUniqueSlug(update.slug, id);
  }
  return categoryRepository.update(id, update);
}

/** Categories still referenced by services cannot be deleted — deactivate them instead. */
export async function deleteCategory(id) {
  await getCategory(id);
  const inUse = await serviceRepository.count([['categoryId', '==', id]]);
  if (inUse > 0) {
    throw ApiError.conflict(
      `This category is used by ${inUse} service(s). Deactivate it instead so existing bookings stay intact.`,
    );
  }
  await categoryRepository.delete(id);
  return { id };
}
