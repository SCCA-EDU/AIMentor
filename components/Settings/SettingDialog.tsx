import { signOut, useSession } from 'next-auth/react';
import { FC, useContext, useEffect } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { trpc } from '@/utils/trpc';

import { Settings } from '@/types/settings';

import HomeContext from '@/pages/api/home/home.context';

import { TemperatureSlider } from '../Chat/Temperature';
import { Dialog } from '../Dialog/Dialog';
import { AllLangs } from './const';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SettingDialog: FC<Props> = ({ open, onClose }) => {
  const { data: session } = useSession();
  const { t } = useTranslation('settings');
  const {
    state: { settings },
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const updateMutation = trpc.settings.settingsUpdate.useMutation();
  const router = useRouter();
  useEffect(() => {
    if (open) {
      dispatch({ type: 'replace_all', value: settings });
    }
  }, [dispatch, open, settings]);

  const handleSave = async () => {
    await updateMutation.mutate(state);
    homeDispatch({ field: 'settings', value: state });
  };

  // Render the dialog.
  return (
    <Dialog open={open} onClose={() => onClose()}>
      <div className="text-lg pb-4 font-bold text-black dark:text-neutral-200">
        {t('Settings')}
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
          {t('Signed In As')}
        </div>
        <button
          type="button"
          className="text-black dark:text-neutral-200"
          onClick={() => signOut()}
        >
          {t('Sign Out')}
        </button>
      </div>
      <div className="text-[12px] text-black/50 dark:text-white/50 text-sm mb-4">
        {session?.user?.email}
      </div>
      <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
        {t('Language')}
      </div>

      <select
        className="w-full mb-4 cursor-pointer bg-transparent p-2 text-neutral-700 dark:text-neutral-200"
        value={state.language}
        onChange={(event) => {
          const language = event.target.value;
          dispatch({ field: 'language', value: language });
          router.push(router.pathname, router.asPath, { locale: language });
        }}
      >
        {AllLangs.map((lang, index) => (
          <option value={lang.key} key={index}>
            {lang.title}
          </option>
        ))}
      </select>
      <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
        {t('Theme')}
      </div>

      <select
        className="w-full cursor-pointer bg-transparent p-2 text-neutral-700 dark:text-neutral-200 mb-4"
        value={state.theme}
        onChange={(event) =>
          dispatch({ field: 'theme', value: event.target.value })
        }
      >
        <option value="dark">{t('Dark mode')}</option>
        <option value="light">{t('Light mode')}</option>
      </select>

      <div className="text-sm font-bold mt-2 mb-2 text-black dark:text-neutral-200">
        {t('Temperature')}
      </div>

      <TemperatureSlider
        onChangeTemperature={(temperature) =>
          dispatch({ field: 'defaultTemperature', value: temperature })
        }
      />

      <button
        type="button"
        className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
        onClick={() => {
          handleSave();
          onClose();
        }}
      >
        {t('Save')}
      </button>
    </Dialog>
  );
};
