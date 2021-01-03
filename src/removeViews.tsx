/**
 * Clear remaining BrowserViews from previous instances
 */
import { remote } from 'electron';

const removeViews = () => {
  const views = remote.webContents.getAllWebContents();
  console.log(views)
  views.forEach((view) => {
    console.log(view.getType())
    if (view.getType() === "browserView") {
      view.destroy()
    }
  });
};

export default removeViews;