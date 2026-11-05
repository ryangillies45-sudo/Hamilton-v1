import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {FPS, FRAMES, H, SCALE, W} from './config/video';
import {Film} from './Film';

// Main renders the logical 480x270 film; tools/render.sh scales it 4x with
// nearest-neighbour to the 1920x1080 master. Preview4x is for Remotion Studio.
const Preview: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Film scale={SCALE} />
	</AbsoluteFill>
);

export const Root: React.FC = () => (
	<>
		<Composition id="Main" component={Film} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
		<Composition id="Preview4x" component={Preview} durationInFrames={FRAMES} fps={FPS} width={W * SCALE} height={H * SCALE} />
	</>
);
