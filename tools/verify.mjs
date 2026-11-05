// Verifies the master: 1080x1920 (9:16), 30 fps, exactly 2,100 frames, 70.0 s, no audio.
import {execFileSync} from 'node:child_process';
const file = process.argv[2];
const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file]).toString());
const v = j.streams.find((s) => s.codec_type === 'video');
const audio = j.streams.filter((s) => s.codec_type === 'audio').length;
const checks = {
	width: [v.width, 1080],
	height: [v.height, 1920],
	aspect: [v.width * 16 === v.height * 9 ? '9:16' : 'other', '9:16'],
	fps: [v.r_frame_rate, '30/1'],
	frames: [Number(v.nb_read_frames), 2100],
	duration: [Number(Number(j.format.duration).toFixed(3)), 70],
	audioStreams: [audio, 0],
};
let ok = true;
for (const [k, [got, want]] of Object.entries(checks)) {
	const pass = got === want;
	ok &&= pass;
	console.log(`${pass ? 'PASS' : 'FAIL'}  ${k.padEnd(13)} ${got}${pass ? '' : `  (want ${want})`}`);
}
console.log(`codec ${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.color_space ?? ''}`);
process.exit(ok ? 0 : 1);
