import type { AppLanguage } from '../hooks/useLanguage';
import { FavoritesManager } from '../components/FavoritesManager';

interface SettingsPageProps {
  defaultBlindMode: boolean;
  onSetDefaultBlindMode: (value: boolean) => void;
  favorites: string[];
  toggleFavorite: (team: string) => void;
  onResetPersonalization: () => void;
  allTeams: string[];
  language: AppLanguage;
  onSetLanguage: (lang: AppLanguage) => void;
}

export function SettingsPage({
  defaultBlindMode,
  onSetDefaultBlindMode,
  favorites,
  toggleFavorite,
  onResetPersonalization,
  allTeams,
  language,
  onSetLanguage,
}: SettingsPageProps) {
  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h1 className="text-lg font-semibold text-white">設定</h1>
        <p className="mt-1 text-sm text-slate-400">ネタバレ表示や表示言語、パーソナライズを調整します。</p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Blind Mode</h2>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Configure your spoiler and personalization preferences.</p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Blind Mode defaults</h2>
        <button
          onClick={() => onSetDefaultBlindMode(!defaultBlindMode)}
          className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-500"
        >
          デフォルト: {defaultBlindMode ? 'ON' : 'OFF'}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Language</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onSetLanguage('ja')}
            className={`rounded-lg border px-3 py-2 text-sm ${language === 'ja' ? 'border-brand-500 text-brand-500' : 'border-slate-700 text-slate-200'}`}
          >
            日本語
          </button>
          <button
            onClick={() => onSetLanguage('en')}
            className={`rounded-lg border px-3 py-2 text-sm ${language === 'en' ? 'border-brand-500 text-brand-500' : 'border-slate-700 text-slate-200'}`}
          >
            English
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">お気に入りクラブ</h2>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Favorite clubs</h2>
        <FavoritesManager allTeams={allTeams} favorites={favorites} toggleFavorite={toggleFavorite} />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">パーソナライズ</h2>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Personalization</h2>
        <button
          onClick={onResetPersonalization}
          className="rounded-lg border border-rose-500 px-3 py-2 text-sm text-rose-400"
        >
          視聴履歴とおすすめをリセット
        </button>
      </section>
    </main>
  );
}
