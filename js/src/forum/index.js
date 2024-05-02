import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Tag from 'flarum/tags/models/Tag';
import Model from 'flarum/common/Model';
import Discussion from 'flarum/common/models/Discussion';
import IndexPage from 'flarum/forum/components/IndexPage';
import TagLinkButton from 'flarum/tags/components/TagLinkButton';
import icon from 'flarum/common/helpers/icon';
import TagPasswordRequired from './components/TagPasswordRequired';
import TagGroupRequired from './components/TagGroupRequired';

import TagsPage from 'flarum/tags/components/TagsPage';
import tagIcon from 'flarum/tags/common/helpers/tagIcon';
import sortTags from 'flarum/tags/common/utils/sortTags';
import classList from 'flarum/common/utils/classList';
import textContrastClass from 'flarum/common/helpers/textContrastClass';
import Link from 'flarum/common/components/Link';
import humanTime from 'flarum/common/helpers/humanTime';
import DiscussionList from 'flarum/forum/components/DiscussionList';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import TagProtectedDiscussionListItem from './components/TagProtectedDiscussionListItem';
import ItemList from 'flarum/common/utils/ItemList';
import tagLabel from '../common/helpers/tagLabel';

/*
 * Used for finding the correct location to replace the main DiscussionList with protection section
 */
function findDiscussionList(vdom, classNames, classNameIndex, replaceChild) {
  vdom.children.forEach((child) => {
    if (child.attrs.className && child.attrs.className.indexOf(classNames[classNameIndex]) !== -1) {
      classNameIndex += 1;
      if (classNameIndex == classNames.length) {
        // Found the final contrainer that has DisussionList, this need to be replaced
        child.children = replaceChild;
        return; // Stop loop
      }
      return findDiscussionList(child, classNames, classNameIndex, replaceChild);
    }
  });
}

function amendViewForTag(vdom, tag, isProtected, lockIcon) {
  if (isProtected) {
    if (tag.isUnlocked()) {
      if (tag.isLockedIconDisplayed()) {
        vdom.children.push(icon('fas fa-unlock'));
      }
    } else if (tag.isProtectedTagDisplayedForSidebar()) {
      vdom.children.push(lockIcon);
    } else {
      vdom.attrs.className += ' hiddenTag';
    }
  }
}

function amendTagTileHeading(tag) {
  if (tag.isGroupProtected() && !tag.isUnlocked()) {
    return <div class="TagsPageGroupProtection"></div>;
  } else if (tag.isPasswordProtected() && !tag.isUnlocked()) {
    return <div class="TagsPagePasswordProtection"></div>;
  } else {
    return <></>;
  }
}

function amendTagTileLastPostedDiscussion(tag) {
  if (tag.isGroupProtected() && !tag.isUnlocked()) {
    return (
      <div>
        {icon('fas fa-user-lock')} {app.translator.trans('datlechin-tag-passwords.forum.tags_page.group_protected')}
      </div>
    );
  } else if (tag.isPasswordProtected() && !tag.isUnlocked()) {
    return (
      <div>
        {icon('fas fa-lock')} {app.translator.trans('datlechin-tag-passwords.forum.tags_page.password_protected')}
      </div>
    );
  } else {
    const lastPostedDiscussion = tag.lastPostedDiscussion();
    if (lastPostedDiscussion) {
      if (lastPostedDiscussion.numberOfProtectedTags() > 0) {
        const protectedPasswordTags = lastPostedDiscussion.protectedPasswordTags();
        const isProtectedPasswordTags = protectedPasswordTags.length > 0;
        const protectedGroupPermissionTags = lastPostedDiscussion.protectedGroupPermissionTags();
        const isProtectedGroupPermissionTags = protectedGroupPermissionTags.length > 0;

        const protectedTags = protectedPasswordTags.concat(protectedGroupPermissionTags);
        return (
          <Link className="TagTile-lastPostedDiscussion" href={'/t/' + protectedTags[0].slug}>
            <span className="TagTile-lastPostedDiscussion-title">
              {isProtectedGroupPermissionTags ? icon('fas fa-user-lock') : <></>}
              {isProtectedPasswordTags ? icon('fas fa-lock') : <></>}
              {isProtectedGroupPermissionTags && isProtectedPasswordTags
                ? app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.multiple')
                : isProtectedGroupPermissionTags
                ? app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.group_protected')
                : app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.password_protected')}
            </span>
            {humanTime(lastPostedDiscussion.lastPostedAt())}
          </Link>
        );
      } else {
        return (
          <Link className="TagTile-lastPostedDiscussion" href={app.route.discussion(lastPostedDiscussion, lastPostedDiscussion.lastPostNumber())}>
            <span className="TagTile-lastPostedDiscussion-title">{lastPostedDiscussion.title()}</span>
            {humanTime(lastPostedDiscussion.lastPostedAt())}
          </Link>
        );
      }
    } else {
      return <span className="TagTile-lastPostedDiscussion" />;
    }
  }
}

function processDiscussionListItem(discussion, pageNum, pageSize, itemNum, params) {
  if (discussion.numberOfProtectedTags() > 0) {
    params.displayProtectedTagForDiscussionList = app.forum.attribute('flarum-tag-passwords.displayProtectedTagForDiscussionList');
    params.displayDiscussionAvatar = app.forum.attribute('flarum-tag-passwords.displayDiscussionAvatar');
    params.displayDiscussionLabel = app.forum.attribute('flarum-tag-passwords.displayDiscussionLabel');
    return (
      <li key={0} data-id={0} role="article" aria-setsize="-1" aria-posinset={pageNum * pageSize + itemNum}>
        <TagProtectedDiscussionListItem discussion={discussion} params={params} />
      </li>
    );
  } else {
    return (
      <li key={discussion.id()} data-id={discussion.id()} role="article" aria-setsize="-1" aria-posinset={pageNum * pageSize + itemNum}>
        <DiscussionListItem discussion={discussion} params={params} />
      </li>
    );
  }
}

/**
 * Used for amend the Tags Page footer of secondary tags
 * @param {*} cloud
 * @returns
 */
function processCloudView(cloud) {
  return <div className="TagCloud">{cloud.map((tag) => [tagLabel(tag, { link: true }, tag.isProtectedTagDisplayedForTagsPage()), ' '])}</div>;
}

function extendDiscussionListView() {
  /**
   * @type {import('flarum/forum/states/DiscussionListState').default}
   */
  const state = this.attrs.state;

  const params = state.getParams();
  const isLoading = state.isInitialLoading() || state.isLoadingNext();

  let loading;

  if (isLoading) {
    loading = <LoadingIndicator />;
  } else if (state.hasNext()) {
    loading = (
      <Button className="Button" onclick={state.loadNext.bind(state)}>
        {app.translator.trans('core.forum.discussion_list.load_more_button')}
      </Button>
    );
  }

  if (state.isEmpty()) {
    const text = app.translator.trans('core.forum.discussion_list.empty_text');
    return (
      <div className="DiscussionList">
        <Placeholder text={text} />
      </div>
    );
  }

  const pageSize = state.pageSize;
  return (
    <div className={classList('DiscussionList', { 'DiscussionList--searchResults': state.isSearchResults() })}>
      <ul role="feed" aria-busy={isLoading} className="DiscussionList-discussions">
        {state.getPages().map((pg, pageNum) => {
          return pg.items.map((discussion, itemNum) => processDiscussionListItem(discussion, pageNum, pageSize, itemNum, params));
        })}
      </ul>
      <div className="DiscussionList-loadMore">{loading}</div>
    </div>
  );
}

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  Tag.prototype.isPasswordProtected = Model.attribute('isPasswordProtected');
  Tag.prototype.isGroupProtected = Model.attribute('isGroupProtected');
  Tag.prototype.isUnlocked = Model.attribute('isUnlocked');
  Tag.prototype.password = Model.attribute('password');
  Tag.prototype.isLockedIconDisplayed = Model.attribute('isLockedIconDisplayed');
  Tag.prototype.isProtectedTagDisplayedForSidebar = Model.attribute('isProtectedTagDisplayedForSidebar');
  Tag.prototype.isProtectedTagDisplayedForTagsPage = Model.attribute('isProtectedTagDisplayedForTagsPage');
  Discussion.prototype.protectedPasswordTags = Model.attribute('protectedPasswordTags');
  Discussion.prototype.protectedGroupPermissionTags = Model.attribute('protectedGroupPermissionTags');
  Discussion.prototype.numberOfProtectedTags = Model.attribute('numberOfProtectedTags');

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

  override(DiscussionList.prototype, 'view', extendDiscussionListView);

  extend(IndexPage.prototype, 'sidebarItems', function (items) {
    const tag = this.currentTag();

    if (tag && (tag.isPasswordProtected() || tag.isGroupProtected()) && !tag.isUnlocked()) {
      const item = items.get('newDiscussion');

      item.children = app.translator.trans('core.forum.index.cannot_start_discussion_button');
      item.attrs.disabled = true;
    }
  });

  extend(TagLinkButton.prototype, 'view', function (vdom) {
    const tag = this.attrs.model;
    amendViewForTag(vdom, tag, tag.isPasswordProtected(), icon('fas fa-lock'));
    amendViewForTag(vdom, tag, tag.isGroupProtected(), icon('fas fa-user-lock'));
  });

  override(TagsPage.prototype, 'tagTileView', function (original, ...args) {
    if (args.length > 0 && args[0] instanceof Tag) {
      const tag = args[0];
      if (tag.isUnlocked() || (!tag.isGroupProtected() && !tag.isPasswordProtected()) || tag.isProtectedTagDisplayedForTagsPage()) {
        const children = sortTags(tag.children() || []);

        return (
          <li className={classList('TagTile', { colored: tag.color() }, textContrastClass(tag.color()))} style={{ '--tag-bg': tag.color() }}>
            <Link className="TagTile-info" href={app.route.tag(tag)}>
              {tag.icon() && tagIcon(tag, {}, { useColor: false })}
              {amendTagTileHeading(tag)}
              <h3 className="TagTile-name">{tag.name()}</h3>

              <p className="TagTile-description">{tag.description()}</p>
              {!!children && (
                <div className="TagTile-children">
                  {children.map((child) => {
                    let iconObject = null;
                    if (child.isPasswordProtected()) {
                      if (child.isUnlocked()) {
                        if (child.isLockedIconDisplayed()) {
                          iconObject = icon('fas fa-unlock', { style: { fontSize: '13px', float: 'none' } });
                        }
                      } else if (child.isProtectedTagDisplayedForTagsPage()) {
                        iconObject = icon('fas fa-lock', { style: { fontSize: '13px', float: 'none' } });
                      } else {
                        return <></>;
                      }
                    }
                    if (child.isGroupProtected()) {
                      if (child.isUnlocked()) {
                        if (child.isLockedIconDisplayed()) {
                          iconObject = icon('fas fa-unlock', { style: { fontSize: '13px', float: 'none' } });
                        }
                      } else if (child.isProtectedTagDisplayedForTagsPage()) {
                        iconObject = icon('fas fa-user-lock', { style: { fontSize: '13px', float: 'none' } });
                      } else {
                        return <></>;
                      }
                    }

                    return [
                      <Link href={app.route.tag(child)}>
                        {child.name()} {iconObject}
                      </Link>,
                      ' ',
                    ];
                  })}
                </div>
              )}
            </Link>

            <span className="TagTile-lastPostedDiscussion">{amendTagTileLastPostedDiscussion(tag)}</span>
          </li>
        );
      } else {
        return '';
      }
    } else {
      return original(...args);
    }
  });

  override(TagsPage.prototype, 'contentItems', function () {
    const items = new ItemList();

    if (this.loading) {
      items.add('loading', <LoadingIndicator />);
    } else {
      const pinned = this.tags.filter((tag) => tag.position() !== null);
      const cloud = this.tags.filter((tag) => tag.position() === null);

      items.add('tagTiles', this.tagTileListView(pinned), 100);

      if (cloud.length) {
        items.add('cloud', processCloudView(cloud), 10);
      }
    }

    return items;
  });
});
