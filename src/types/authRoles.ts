export type AppRole = 'user' | 'pending_farmer' | 'farmer';

export type FarmerApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface ProfileRow {
  id: string;
  role: AppRole;
  phone: string | null;
  wechat_qr_url: string | null;
  ranch_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerApplicationRow {
  id: string;
  user_id: string;
  real_name: string;
  id_card: string;
  ranch_proof_video: string;
  status: FarmerApplicationStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerApplicationInput {
  real_name: string;
  id_card: string;
  ranch_proof_video: string;
  phone?: string | null;
  wechat_qr_url?: string | null;
  ranch_location?: string | null;
}

export interface ProductInsertInput {
  product_name: string;
  description?: string | null;
  price?: number | null;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  user: '普通消费者',
  pending_farmer: '待审核发布者',
  farmer: '已认证发布者',
};

export function canApplyForFarmer(role: AppRole) {
  return role === 'user';
}

export function canWriteProducts(role: AppRole) {
  return role === 'farmer';
}
