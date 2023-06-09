import { NextApiRequest, NextApiResponse } from 'next';

import { ensureHasValidSession } from '@/utils/server/auth';

import { readFileSync } from 'fs';
import multiparty from 'multiparty';
import { Configuration, OpenAIApi } from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await ensureHasValidSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const form = new multiparty.Form();
    const data: Record<string, { path: string; originalFilename: string }[]> =
      await new Promise((resolve, reject) => {
        form.parse(
          req,
          function (
            err: any,
            fields: any,
            files: Record<string, { path: string; originalFilename: string }[]>,
          ) {
            if (err) reject({ err });
            resolve(files);
          },
        );
      });

    const openai = new OpenAIApi(
      new Configuration({ apiKey: process.env.OPENAI_API_KEY }),
    );
    const readFileResult: Buffer & { name?: string } = readFileSync(
      data.file[0].path,
    );
    readFileResult.name = data.file[0].originalFilename;
    const result = await openai.createTranscription(
      readFileResult as any,
      'whisper-1',
    );
    res.status(result.status);
    res.send({
      success: result.status === 200,
      text: result.data.text,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default handler;
