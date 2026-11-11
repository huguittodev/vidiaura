import * as fs from 'fs';
import * as path from 'path';
import { generateCreativeDirectorSceneGraph } from '../src/lib/ai/gemini-adapter';
import { SceneGraphSchema } from '../src/lib/scene-graph/schema';
import { execSync } from 'child_process';

if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

async function run() {
  console.log('--- GENERATING ZENTIOGRID VIDEO WITH VIDIAURA & GEMINI ---');
  
  const zentiogridBrief = {
    productName: 'ZentioGrid',
    tagline: 'The Autonomous E-Commerce Operating System',
    description: 'ZentioGrid is an AI-native operating system for modern e-commerce brands: autonomous inventory orchestration, real-time demand forecasting, and instant omnichannel synchronization.',
    ctaText: 'Deploy Your Grid Free',
    features: [
      'Autonomous Inventory Allocation',
      'Real-Time Demand Prediction',
      'Sub-Second Omnichannel Sync',
      'AI Storefront Optimization'
    ],
  };

  const res = await generateCreativeDirectorSceneGraph(zentiogridBrief);
  console.log('Generation Source:', res.source);
  console.log('Model:', res.model);
  if (res.reason) console.log('Reason:', res.reason);

  const sceneGraph = res.sceneGraph;
  // Double-validate with Zod
  const validated = SceneGraphSchema.parse(sceneGraph);
  console.log('Validated SceneGraph successfully! Scenes count:', validated.scenes.length);
  console.log('Scenes sequence:', validated.scenes.map(s => `${s.type} (${s.durationInFrames} frames)`));
  console.log('Camera keyframes:', validated.cameraTrack.length);
  console.log('Cursor keyframes:', validated.cursorTrack.length);
  console.log('Audio cues:', validated.audioTrack.length);

  const propsPath = path.resolve('out/zentiogrid-props.json');
  fs.mkdirSync(path.dirname(propsPath), { recursive: true });
  fs.writeFileSync(propsPath, JSON.stringify({ sceneGraph: validated }, null, 2));
  console.log('Wrote props to:', propsPath);

  const outputPath = path.resolve('out/Zentiogrid.mp4');
  console.log(`Rendering Remotion video to ${outputPath}...`);
  const cmd = `npx remotion render remotion/index.ts InteractiveSurfaceDemo ${outputPath} --props=${propsPath} --overwrite`;
  console.log('Executing:', cmd);
  execSync(cmd, { stdio: 'inherit' });

  const stats = fs.statSync(outputPath);
  console.log(`\n✅ Render complete! File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB at ${outputPath}`);
}

run().catch((err) => {
  console.error('Fatal error during generation or render:', err);
  process.exit(1);
});

