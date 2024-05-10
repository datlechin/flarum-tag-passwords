import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import TagPasswordRequired from './components/TagPasswordRequired';
import TagGroupRequired from './components/TagGroupRequired';

export default function () {
  /*
   * Used for finding the correct location to replace the main DiscussionList with protection section
   */
  function findDiscussionList(vdom, classNames, classNameIndex, replaceChild) {
    for (var child of vdom.children) {
      if (child.attrs.className && child.attrs.className.indexOf(classNames[classNameIndex]) !== -1) {
        classNameIndex += 1;
        if (classNameIndex == classNames.length) {
          // Found the final contrainer that has DisussionList, this need to be replaced
          child.children = replaceChild;
          return; // Stop loop
        }
        return findDiscussionList(child, classNames, classNameIndex, replaceChild);
      }
    }
  }

  extend(IndexPage.prototype, 'view', function (vdom) {
    const tag = this.currentTag();
    if (tag && !tag.isUnlocked()) {
      if (tag.isGroupProtected()) {
        findDiscussionList(vdom, ['container', 'sideNavContainer', 'IndexPage-results'], 0, [TagGroupRequired.component({ currentTag: tag })]);
      } else if (tag.isPasswordProtected()) {
        findDiscussionList(vdom, ['container', 'sideNavContainer', 'IndexPage-results'], 0, [TagPasswordRequired.component({ currentTag: tag })]);
      }
    }
  });
}
