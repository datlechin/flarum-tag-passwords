import { extend, override } from 'flarum/common/extend';
import DiscussionProtectionHero from './components/DiscussionProtectionHero';

export default function addDiscussionProtection() {
  // Override hero to show protection notice with password forms when discussion has protected tags
  override('flarum/forum/components/DiscussionPage', 'hero', function (original) {
    if (this.discussion && this.discussion.numberOfProtectedTags() > 0) {
      return <DiscussionProtectionHero discussion={this.discussion} />;
    }

    return original();
  });

  // Hide post stream when discussion has protected tags
  extend('flarum/forum/components/DiscussionPage', 'view', function (vdom) {
    if (!this.discussion || this.discussion.numberOfProtectedTags() === 0) {
      return;
    }

    // Remove children (post stream) from PageStructure
    if (vdom && vdom.children) {
      vdom.children = [];
    }

    // Also remove the sidebar attr so PageStructure renders no sidebar
    if (vdom && vdom.attrs) {
      vdom.attrs.sidebar = () => [];
    }
  });
}
