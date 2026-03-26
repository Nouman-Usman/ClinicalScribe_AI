export const gradients = {
  primary: 'bg-gradient-to-br from-blue-500 to-blue-700',
  primaryLight: 'bg-gradient-to-br from-blue-400 to-blue-600',
  secondary: 'bg-gradient-to-br from-violet-500 to-violet-700',
  secondaryLight: 'bg-gradient-to-br from-violet-400 to-purple-600',
  success: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
  warning: 'bg-gradient-to-br from-amber-400 to-amber-600',
  danger: 'bg-gradient-to-br from-red-500 to-red-700',
  surface: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
  mesh: 'bg-[radial-gradient(at_20%_80%,hsla(207,60%,50%,0.15),transparent_50%),radial-gradient(at_80%_20%,hsla(260,60%,60%,0.1),transparent_50%)]',
  glass: 'bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-900/60 dark:to-slate-800/30',
  heroMesh: 'bg-[radial-gradient(at_30%_70%,hsla(207,60%,50%,0.2),transparent_60%),radial-gradient(at_70%_30%,hsla(260,60%,60%,0.15),transparent_60%),radial-gradient(at_50%_50%,hsla(180,60%,50%,0.08),transparent_70%)]',
} as const;

export const textGradients = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent',
  secondary: 'bg-gradient-to-r from-violet-600 to-purple-400 bg-clip-text text-transparent',
  accent: 'bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent',
} as const;
