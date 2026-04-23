import type {
  FarmerApplicationInput,
  FarmerApplicationRow,
  ProductInsertInput,
  ProfileRow,
} from '../../types/authRoles';
import { canWriteProducts } from '../../types/authRoles';

type Result<T> = Promise<{ data: T | null; error: Error | null }>;
type MultiResult<T> = Promise<{ data: T[] | null; error: Error | null }>;

interface AuthUser {
  id: string;
}

interface SupabaseLikeClient {
  auth: {
    getUser(): Promise<{ data: { user: AuthUser | null }; error: Error | null }>;
  };
  from(table: string): any;
}

export interface FarmerProductRow {
  id: string;
  owner_id: string;
  product_name: string;
  description: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewListingRow extends FarmerApplicationRow {
  profile: ProfileRow | null;
}

async function requireUser(client: SupabaseLikeClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error('用户未登录，无法执行该操作。');
  }

  return data.user;
}

export async function getCurrentProfile(client: SupabaseLikeClient) {
  const user = await requireUser(client);
  const { data, error } = await client
    .from('profiles')
    .select('id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    throw new Error('读取用户资料失败。');
  }

  return data as unknown as ProfileRow;
}

export async function ensureCurrentProfile(
  client: SupabaseLikeClient,
  defaults?: {
    phone?: string | null;
    wechat_qr_url?: string | null;
    ranch_location?: string | null;
  },
) {
  const user = await requireUser(client);
  const existing = await client
    .from('profiles')
    .select('id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at')
    .eq('id', user.id)
    .single();

  if (existing.data) {
    return existing.data as unknown as ProfileRow;
  }

  const now = new Date().toISOString();
  const { data, error } = await client
    .from('profiles')
    .upsert(
      {
        id: user.id,
        role: 'user',
        phone: defaults?.phone ?? null,
        wechat_qr_url: defaults?.wechat_qr_url ?? null,
        ranch_location: defaults?.ranch_location ?? null,
        created_at: now,
        updated_at: now,
      },
      { onConflict: 'id' },
    )
    .select('id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at')
    .single();

  if (error || !data) {
    throw new Error('初始化用户资料失败。');
  }

  return data as unknown as ProfileRow;
}

export async function updateCurrentProfile(
  client: SupabaseLikeClient,
  payload: {
    phone?: string | null;
    wechat_qr_url?: string | null;
    ranch_location?: string | null;
  },
) {
  const user = await requireUser(client);
  const { data, error } = await client
    .from('profiles')
    .update({
      phone: payload.phone ?? null,
      wechat_qr_url: payload.wechat_qr_url ?? null,
      ranch_location: payload.ranch_location ?? null,
    })
    .eq('id', user.id)
    .select('id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at')
    .single();

  if (error || !data) {
    throw new Error('更新数字名片失败。');
  }

  return data as unknown as ProfileRow;
}

export async function applyForFarmer(
  client: SupabaseLikeClient,
  payload: FarmerApplicationInput,
) {
  const user = await requireUser(client);

  const { error: profileError } = await client.from('profiles').update({
    phone: payload.phone ?? null,
    wechat_qr_url: payload.wechat_qr_url ?? null,
    ranch_location: payload.ranch_location ?? null,
  }).eq('id', user.id);

  if (profileError) {
    throw new Error('更新资料失败，无法提交农户申请。');
  }

  const { data, error } = await client
    .from('farmer_applications')
    .insert({
      user_id: user.id,
      real_name: payload.real_name,
      id_card: payload.id_card,
      ranch_proof_video: payload.ranch_proof_video,
      status: 'pending',
    })
    .select(
      'id, user_id, real_name, id_card, ranch_proof_video, status, review_note, reviewed_at, created_at, updated_at',
    )
    .single();

  if (error || !data) {
    throw new Error('农户申请提交失败。');
  }

  // 数据库触发器会自动把 profiles.role 从 user 改为 pending_farmer。
  return data as unknown as FarmerApplicationRow;
}

export async function createProductAsFarmer(
  client: SupabaseLikeClient,
  product: ProductInsertInput,
) {
  const user = await requireUser(client);
  const profile = await getCurrentProfile(client);

  if (!canWriteProducts(profile.role)) {
    throw new Error('当前用户不是 farmer，不能发布产品。');
  }

  const { data, error } = await client
    .from('products')
    .insert({
      owner_id: user.id,
      product_name: product.product_name,
      description: product.description ?? null,
      price: product.price ?? null,
    })
    .select('id, owner_id, product_name, description, price, created_at, updated_at')
    .single();

  if (error || !data) {
    throw new Error('产品写入失败，请检查 RLS 或字段配置。');
  }

  return data;
}

export async function listCurrentFarmerProducts(client: SupabaseLikeClient) {
  const user = await requireUser(client);
  const { data, error } = await client
    .from('products')
    .select('id, owner_id, product_name, description, price, created_at, updated_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('读取我的商品失败。');
  }

  return (data ?? []) as FarmerProductRow[];
}

export async function deleteCurrentFarmerProduct(
  client: SupabaseLikeClient,
  productId: string,
) {
  const user = await requireUser(client);
  const { error } = await client
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('owner_id', user.id);

  if (error) {
    throw new Error('商品下架失败，请检查权限配置。');
  }
}

export async function getLatestCurrentApplication(client: SupabaseLikeClient) {
  const user = await requireUser(client);
  const { data, error } = await client
    .from('farmer_applications')
    .select(
      'id, user_id, real_name, id_card, ranch_proof_video, status, review_note, reviewed_at, created_at, updated_at',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error('读取申请状态失败。');
  }

  return ((data ?? [])[0] ?? null) as FarmerApplicationRow | null;
}

async function getProfileById(client: SupabaseLikeClient, id: string) {
  const { data, error } = await client
    .from('profiles')
    .select('id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as ProfileRow;
}

export async function listFarmerApplicationsForReview(client: SupabaseLikeClient) {
  const { data, error } = await client
    .from('farmer_applications')
    .select(
      'id, user_id, real_name, id_card, ranch_proof_video, status, review_note, reviewed_at, created_at, updated_at',
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('读取审核列表失败。');
  }

  const applications = (data ?? []) as FarmerApplicationRow[];
  const enriched = await Promise.all(
    applications.map(async (item) => ({
      ...item,
      profile: await getProfileById(client, item.user_id),
    })),
  );

  return enriched as ReviewListingRow[];
}

export async function reviewFarmerApplication(
  client: SupabaseLikeClient,
  payload: {
    applicationId: string;
    userId: string;
    status: 'approved' | 'rejected';
    reviewNote: string;
  },
) {
  const reviewedAt = new Date().toISOString();
  const { error: applicationError } = await client
    .from('farmer_applications')
    .update({
      status: payload.status,
      review_note: payload.reviewNote,
      reviewed_at: reviewedAt,
    })
    .eq('id', payload.applicationId);

  if (applicationError) {
    throw new Error('更新审核状态失败。');
  }

  const nextRole = payload.status === 'approved' ? 'farmer' : 'user';
  const { error: profileError } = await client
    .from('profiles')
    .update({
      role: nextRole,
    })
    .eq('id', payload.userId);

  if (profileError) {
    throw new Error('同步用户角色失败。');
  }
}
