import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import TagProtectionHero from './components/TagProtectionHero';

export default function addTagProtection() {
  extend(IndexPage.prototype, 'view', function (vdom) {
    const tag = app.currentTag();

    if (!tag) return;

    const isProtected = tag.isPasswordProtected() || tag.isGroupProtected();
    const isUnlocked = tag.isUnlocked();

    if (!isProtected || isUnlocked) return;

    if (vdom && vdom.children) {
      vdom.children = [<TagProtectionHero tag={tag} />];
    }
  });
}
