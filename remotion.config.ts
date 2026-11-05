import {Config} from '@remotion/cli/config';

// In the cloud sandbox Remotion uses the pre-installed Chromium (set
// REMOTION_BROWSER). On a normal PC leave it unset: Remotion downloads its own.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
