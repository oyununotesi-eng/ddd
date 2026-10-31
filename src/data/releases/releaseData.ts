import productsJson from './products.json';
import sourcesJson from './sources.json';
import type {
  ProductRelease,
  ProductReleaseData,
  ReleaseCompatibilityEntry,
  ReleaseLifecyclePhase,
  ReleaseProduct,
  ReleaseSource,
} from '../../types';

const products = productsJson as ReleaseProduct[];
const sources = sourcesJson as ReleaseSource[];
const releaseDataFiles = import.meta.glob('./products/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, ProductReleaseData>;

export const compareReleaseVersions = (left: string, right: string): number => {
  const leftParts = left.match(/\d+/g)?.map(Number) || [];
  const rightParts = right.match(/\d+/g)?.map(Number) || [];
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference) return difference;
  }
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
};

const getProductData = (productId: string): ProductReleaseData | null => {
  const product = getProductById(productId);
  if (!product) return null;
  return releaseDataFiles[`./products/${product.dataFile}`] || null;
};

export const getProductDataById = (productId: string): ProductReleaseData | null => getProductData(productId);

export const getProducts = (): ReleaseProduct[] => products.filter((product) => product.trackingEnabled);

export const getProductById = (productId: string): ReleaseProduct | null =>
  products.find((product) => product.id === productId) || null;

export const getProductReleases = (productId: string): ProductRelease[] => {
  const data = getProductData(productId);
  if (!data) return [];
  return [...data.releases].sort((left, right) => compareReleaseVersions(right.version, left.version));
};

export const getReleaseById = (productId: string, releaseId: string): ProductRelease | null =>
  getProductReleases(productId).find((release) => release.id === releaseId) || null;

export const getReleaseCompatibility = (productId: string): ReleaseCompatibilityEntry[] =>
  getProductData(productId)?.compatibility || [];

export const getReleaseLifecycle = (productId: string): ReleaseLifecyclePhase[] =>
  getProductData(productId)?.lifecycle || [];

export const getProductSources = (productId: string): ReleaseSource[] =>
  sources.filter((source) => source.productId === productId);

export const getProductLastVerifiedAt = (productId: string): string | null =>
  getProductData(productId)?.lastVerifiedAt || null;

export const getUpdatesAvailable = (product: ReleaseProduct): number | null => {
  if (!product.installedVersion) return null;
  return getProductReleases(product.id).filter((release) =>
    release.status === 'Released' && compareReleaseVersions(release.version, product.installedVersion!) > 0,
  ).length;
};

export const getUpcomingReleases = (productId: string): ProductRelease[] =>
  getProductReleases(productId).filter((release) => {
    if (!release.publishedAt) return false;
    const date = new Date(release.publishedAt);
    return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
  });
