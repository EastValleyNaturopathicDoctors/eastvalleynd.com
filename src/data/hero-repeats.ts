/**
 * Hand-kept (not generated). A page whose body opens with the same picture as
 * its top image, saved in WordPress under another file name -> that body
 * image's file name (tracker R5). Readers saw the banner twice within one
 * screen. The page shows it once (heroOnce, src/lib/hero.ts): the body's copy
 * goes, unless it is a link, which then stays in place of the top image.
 *
 * The permanent fix is upstream: extract/build_blog.py and build_content_pages.py
 * dropping the repeated inline image (or the featured image, where the inline
 * one links somewhere) from the content file. An entry here can be deleted
 * once its body no longer carries the file.
 */
export const heroRepeats: Record<string, string> = {
  '/the-healing-potential-of-stem-cell-therapy/': '2017-03-Stem-Cell-AD_Moment.jpg',
  '/what-is-neurofeedback/': '2016-06-Neurofeedback-EVND.png',
  '/how-neurofeedback-helps-wth-reading-and-learning-disorders/': '2017-07-Reading-disorders.jpg',
  '/the-benefits-of-neurofeedback-in-adhd-treatment/': '2017-02-Neurofeedback-treatment-for-ADHD.png',
  '/how-neurofeedback-can-help-depression/': '2017-07-depression.jpg',
  '/how-neurofeedback-can-help-with-concussions/': '2017-07-Concussion.jpg',
  '/how-neurofeedback-can-help-with-anxiety/': '2017-03-EVND.png',
  '/conditions/childhood-behavioral-disorders/': '2017-03-EVND.png',
};
