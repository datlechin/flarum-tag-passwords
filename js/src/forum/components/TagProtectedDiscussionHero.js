import app from 'flarum/forum/app';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import DiscussionControls from 'flarum/utils/DiscussionControls';
import classList from 'flarum/common/utils/classList';
import Link from 'flarum/common/components/Link';
import Tooltip from 'flarum/common/components/Tooltip';
import humanTime from 'flarum/common/helpers/humanTime';
import avatar from 'flarum/common/helpers/avatar';
import icon from 'flarum/common/helpers/icon';
import tooltipForPermission from '../../common/helpers/tooltipForPermission';
import DiscussionHero from 'flarum/forum/components/DiscussionHero';
import ItemList from 'flarum/common/utils/ItemList';
import listItems from 'flarum/common/helpers/listItems';
import tagsLabel from '../../common/helpers/tagsLabel';

export default class TagProtectedDiscussionHero extends DiscussionHero {
  view() {
    const discussion = this.attrs.discussion;
    const tags = discussion.tags();
    return (
      <header className="Hero DiscussionHero">
        <div className="container">
          <ul className="DiscussionHero-items">{listItems(this.items().toArray())}</ul>
        </div>

      </header>
    );
  }

  /**
   * Build an item list for the contents of the discussion hero.
   *
   * @return {ItemList<import('mithril').Children>}
   */
  items() {
    const items = new ItemList();
    const discussion = this.attrs.discussion;
    const tags = discussion.tags();

    items.add('tags', tagsLabel(tags, {}, false));
    const isProtectedPasswordTags = discussion.protectedPasswordTags().length > 0;
    const isProtectedGroupPermissionTags = discussion.protectedGroupPermissionTags().length > 0;
    let title = app.translator.trans('datlechin-tag-passwords.forum.discussion_page.title.multiple');
    if (isProtectedPasswordTags && !isProtectedGroupPermissionTags) {
      title = app.translator.trans('datlechin-tag-passwords.forum.discussion_page.title.password_protected');
    } else if (!isProtectedPasswordTags && isProtectedGroupPermissionTags) {
      title = app.translator.trans('datlechin-tag-passwords.forum.discussion_page.title.group_protected');
    }
    items.add('title', <h2 className="DiscussionHero-title">{title}</h2>);
    items.add('tags-protected', tagsLabel(tags, {link: true}, true, false));

    return items;
  }
}
