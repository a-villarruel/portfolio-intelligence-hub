import nextTs from 'eslint-config-next/typescript';
import nextVitals from 'eslint-config-next/core-web-vitals';
import base from '../../eslint.config.mjs';

export default [...base, ...nextVitals, ...nextTs];
