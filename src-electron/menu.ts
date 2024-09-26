import {
  Menu,
  dialog,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

const isMac = process.platform === 'darwin';

export const createMenu = () => {
  const template: Array<MenuItemConstructorOptions> = [
    { role: 'appMenu' },
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Subtitles...',
          click: async () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            const { canceled, filePath } = await dialog.showSaveDialog({
              filters: [{ name: 'SubRip', extensions: ['srt'] }],
            });
            if (!canceled && filePath) {
              focusedWindow?.webContents.send('export-subtitles', filePath);
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    { role: 'help' },
  ];
  return Menu.buildFromTemplate(template);
};
