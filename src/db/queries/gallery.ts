import { db } from '../index'
import { galleryPhotos, type NewGalleryPhoto } from '../schema'
import { eq, desc } from 'drizzle-orm'

export async function getAllGalleryPhotos() {
  return db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt))
}

export async function getRecentGalleryPhotos(limit = 6) {
  return db
    .select()
    .from(galleryPhotos)
    .orderBy(desc(galleryPhotos.createdAt))
    .limit(limit)
}

export async function getGalleryPhotoById(id: number) {
  const rows = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id))
  return rows[0] ?? null
}

export async function createGalleryPhoto(data: NewGalleryPhoto) {
  const rows = await db.insert(galleryPhotos).values(data).returning()
  return rows[0]
}

export async function updateGalleryPhoto(id: number, data: Partial<NewGalleryPhoto>) {
  const rows = await db
    .update(galleryPhotos)
    .set(data)
    .where(eq(galleryPhotos.id, id))
    .returning()
  return rows[0]
}

export async function deleteGalleryPhoto(id: number) {
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id))
}
