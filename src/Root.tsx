import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {FPS, FRAMES, H, SCALE, W} from './config/video';
import {Film} from './Film';

// Main renders the logical 360x640 film; tools/render.sh scales it 3x with
// nearest-neighbour to the 1080x1920 master. Preview3x is for Remotion Studio.
const Preview: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Film scale={SCALE} />
	</AbsoluteFill>
);

export const Root: React.FC = () => (
	<>
		<Composition id="Main" component={Film} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
		<Composition id="Preview3x" component={Preview} durationInFrames={FRAMES} fps={FPS} width={W * SCALE} height={H * SCALE} />
	</>
);
