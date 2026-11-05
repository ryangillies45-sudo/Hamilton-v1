import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import {H, W} from './config/video';
import {Assets, loadAssets} from './engine/assets';
import {FB} from './engine/fb';
import {renderFrame} from './timeline';

const fb = new FB();

export const Film: React.FC<{scale?: number}> = ({scale = 1}) => {
	const frame = useCurrentFrame();
	const canvas = useRef<HTMLCanvasElement>(null);
	const [assets, setAssets] = useState<Assets | null>(null);
	const [handle] = useState(() => delayRender('Loading pixel sprites'));

	useEffect(() => {
		loadAssets()
			.then((a) => {
				setAssets(a);
				continueRender(handle);
			})
			.catch((e) => {
				console.error(e);
				throw e;
			});
	}, [handle]);

	useLayoutEffect(() => {
		if (!assets || !canvas.current) return;
		renderFrame(fb, frame, assets);
		const ctx = canvas.current.getContext('2d')!;
		const img = new ImageData(new Uint8ClampedArray(fb.px.buffer.slice(0)), W, H);
		ctx.putImageData(img, 0, 0);
	}, [frame, assets]);

	return (
		<canvas
			ref={canvas}
			width={W}
			height={H}
			style={{width: W * scale, height: H * scale, imageRendering: 'pixelated', display: 'block'}}
		/>
	);
};
