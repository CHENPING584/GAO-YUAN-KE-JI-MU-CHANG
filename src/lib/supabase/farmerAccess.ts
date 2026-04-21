import type {
  FarmerApplicationInput,
  FarmerApplicationRow,
  ProductInsertInput,
  ProfileRow,
} from '../../types/authRoles';
import { canWriteProducts } from '../../types/authRoles';

type Result<T> = Promise<{ data: T | null; error: Error | null }>;

interface AuthUser {
  id: string;
}

interface SupabaseLikeClient {
  auth: {
    getUser(): Promise<{ data: { user: AuthUser | null }; error: Error | null }>;
  };
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        single(): Result<Record<string, unknown>>;
      };
    };
    insert(values: Record<string, unknown>): {
      select(columns: string): {
        single(): Result<Record<string, unknown>>;
      };
    };
    update(values: Record<string, unknown>): {
      eq(column: string, value: string): Result<Record<string, unknown>>;
    };
  };
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
