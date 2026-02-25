import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';
import Component from 'flarum/common/Component';
import Icon from 'flarum/common/components/Icon';
import tagsLabel from 'ext:flarum/tags/common/helpers/tagsLabel';
import { getPostListTitle, getProtectionIcons } from '../common/utils/protectionHelpers';

/**
 * Wrapper component that renders PostsUserPage content and
 * replaces protected post items with protection notices after render.
 */
class ProtectedPostListWrapper extends Component {
  view() {
    return <div className="PostsUserPage-protected-wrapper">{this.attrs.children}</div>;
  }

  oncreate(vnode) {
    super.oncreate(vnode);
    this.processProtection(vnode);
  }

  onupdate(vnode) {
    super.onupdate(vnode);
    this.processProtection(vnode);
  }

  processProtection(vnode) {
    const posts = this.attrs.postsState;
    if (!posts || posts.isEmpty()) return;

    const listElement = vnode.dom.querySelector('.PostList-discussions');
    if (!listElement) return;

    const listItems = listElement.querySelectorAll(':scope > li');
    let postIndex = 0;

    posts.getPages().forEach((pg) => {
      pg.items.forEach((post) => {
        if (postIndex >= listItems.length) return;

        const discussion = post.discussion();
        if (!discussion) {
          postIndex++;
          return;
        }

        const numProtected = discussion.numberOfProtectedTags?.() ?? 0;
        if (numProtected === 0) {
          postIndex++;
          return;
        }

        const li = listItems[postIndex];

        // Already processed
        if (li.dataset.protectionProcessed) {
          postIndex++;
          return;
        }

        li.dataset.protectionProcessed = 'true';

        if (!discussion.isProtectedTagDisplayedForPostList?.()) {
          li.style.display = 'none';
          postIndex++;
          return;
        }

        // Replace content with protection notice
        const title = getPostListTitle(discussion);
        const { hasPassword, hasGroup } = getProtectionIcons(discussion);
        const tags = discussion.tags?.() || [];

        const postListItem = li.querySelector('.PostListItem') || li;
        postListItem.innerHTML = '';
        postListItem.className = 'PostListItem PostListItem--protected';

        const wrapper = document.createElement('div');
        wrapper.className = 'PostsUserPage-main';

        const h2 = document.createElement('h2');
        h2.className = 'PostsUserPage-title';

        if (hasPassword) {
          const icon = document.createElement('i');
          icon.className = 'icon fas fa-lock';
          h2.appendChild(icon);
          h2.appendChild(document.createTextNode(' '));
        }
        if (hasGroup) {
          const icon = document.createElement('i');
          icon.className = 'icon fas fa-user-lock';
          h2.appendChild(icon);
          h2.appendChild(document.createTextNode(' '));
        }

        const titleText = Array.isArray(title) ? title.join('') : String(title || '');
        h2.appendChild(document.createTextNode(titleText));

        const info = document.createElement('ul');
        info.className = 'PostsUserPage-info';

        const tagNames = tags
          .map((t) => t.name?.() || '')
          .filter(Boolean)
          .join(', ');
        if (tagNames) {
          const tagLi = document.createElement('li');
          tagLi.className = 'item-tags';
          tagLi.textContent = tagNames;
          info.appendChild(tagLi);
        }

        wrapper.appendChild(h2);
        wrapper.appendChild(info);
        postListItem.appendChild(wrapper);

        postIndex++;
      });
    });
  }
}

export default function addPostsProtection() {
  override('flarum/forum/components/PostsUserPage', 'content', function (original) {
    const vdom = original();

    return <ProtectedPostListWrapper postsState={this.posts}>{vdom}</ProtectedPostListWrapper>;
  });
}
