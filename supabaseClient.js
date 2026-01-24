// Supabase ライブラリを CDN から読み込む
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase クライアントを作成
const supabase = createClient(
  "https://lcpkqaoaqsotjaydukxs.supabase.co",
  "sb_publishable__fsG5IT4g30OLUOKchn79g_W4vFv6k8"
);