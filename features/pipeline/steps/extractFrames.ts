import path from 'node:path';
import { promises as fs } from 'node:fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import sharp from 'sharp';
import { getProjectDir, ensureProjectDir } from '@/lib/cache';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const TARGET_FPS = 30;

/**
 * Extract frames from the cached video at TARGET_FPS, sharpen each frame via
 * sharp, and save as optimized JPEGs in frames/.
 * Returns the final frame count.
 */
export async function extractFrames(args: { projectId: string }): Promise<{ frameCount: number }> {
  const dir = await ensureProjectDir(args.projectId);
  const videoPath = path.join(dir, 'video.mp4');
  const rawDir = path.join(dir, 'frames-raw');
  const outDir = path.join(dir, 'frames');
  await fs.mkdir(rawDir, { recursive: true });

  // 1. ffmpeg dumps raw PNGs at TARGET_FPS
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions(['-vf', `fps=${TARGET_FPS}`])
      .output(path.join(rawDir, 'frame-%04d.png'))
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .run();
  });

  // 2. sharp sharpens + optimizes each frame to jpeg
  const rawFiles = (await fs.readdir(rawDir))
    .filter((f) => f.endsWith('.png'))
    .sort();

  // Clear existing frames dir to avoid stale mixes
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  let idx = 1;
  for (const raw of rawFiles) {
    const buf = await sharp(path.join(rawDir, raw))
      .sharpen({ sigma: 0.6, m1: 0.3, m2: 0.3 })
      .modulate({ saturation: 1.05 })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await fs.writeFile(path.join(outDir, `${String(idx).padStart(4, '0')}.jpg`), buf);
    idx += 1;
  }

  // 3. cleanup raw
  await fs.rm(rawDir, { recursive: true, force: true });

  return { frameCount: rawFiles.length };
}
