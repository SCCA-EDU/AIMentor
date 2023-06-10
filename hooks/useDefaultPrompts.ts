import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { allPrompts } from '@/utils/app/prompt';

import { OpenAIModels } from '@/types/openai';
import { Prompt } from '@/types/prompt';

import HomeContext from '@/pages/api/home/home.context';

import useFolders from './useFolders';

import { v4 } from 'uuid';

export const defaultFolderId = '_default_prompt_folder_id_';

export const useDefaultPrompts = () => {
  const {
    state: { defaultPrompts, settings, defaultModelId },
    dispatch,
  } = useContext(HomeContext);
  const { t } = useTranslation('prompt');

  const [folder, { addDefaultFolder }] = useFolders();
  const language = settings.language;
  const defaultPromptLists = allPrompts[language] || allPrompts['en'];
  useEffect(() => {
    addDefaultFolder(t('default'), 'prompt', defaultFolderId);
  }, []);
  useEffect(() => {
    if (defaultModelId) {
      dispatch({
        field: 'defaultPrompts',
        value: defaultPromptLists.map(
          (item) =>
            ({
              id: v4(),
              name: item.title,
              description: item.prompt,
              content: item.prompt,
              model: OpenAIModels[defaultModelId],
              folderId: defaultFolderId,
            } as Prompt),
        ),
      });
    }
  }, [defaultPromptLists, defaultModelId]);
};
