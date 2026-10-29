import { isDemoMode } from '../config.js';
import { DEMO_COURSES, demoDelay } from '../data/demo-data.js';
import { get } from './api-client.js';
import { ENDPOINTS } from './endpoints.js';

export const getCoursesOverview = () => (isDemoMode() ? demoDelay(DEMO_COURSES) : get(ENDPOINTS.courses));
