import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';
import Link from 'flarum/common/components/Link';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import PostsUserPage from 'flarum/forum/components/PostsUserPage';
import CommentPost from 'flarum/forum/components/CommentPost';
import ProtectedTag from '../common/models/ProtectedTag';
import tooltipForPermission from '../common/helpers/tooltipForPermission';

function provideTooltip(discussion, isProtectedPasswordTags, isProtectedGroupPermissionTags, tags) {
  let title = app.translator.trans('datlechin-tag-passwords.forum.post_list.title.multiple');
  let info = app.translator.trans('datlechin-tag-passwords.forum.post_list.info.multiple');
  if (isProtectedPasswordTags && !isProtectedGroupPermissionTags) {
    title = app.translator.trans('datlechin-tag-passwords.forum.post_list.title.password_protected');
    info = app.translator.trans('datlechin-tag-passwords.forum.post_list.info.password_protected');
  } else if (!isProtectedPasswordTags && isProtectedGroupPermissionTags) {
    title = app.translator.trans('datlechin-tag-passwords.forum.post_list.title.group_protected');
    info = app.translator.trans('datlechin-tag-passwords.forum.post_list.info.group_protected');
  }
  return tooltipForPermission(discussion, 'PostsUserPage', title, info, isProtectedPasswordTags, isProtectedGroupPermissionTags, tags);
}

export default function () {
  function processProtectedTagsForPost(protectedTags) {
    let collection = [];
    for (let i = 0; i < protectedTags.length; i++) {
      let foundTag = new ProtectedTag();
      foundTag.pushAttributes(protectedTags[i]);
      collection.push(foundTag);
    }
    return collection;
  }

  function extendPostsUserPageContent() {
    if (this.posts.length === 0 && !this.loading) {
      return (
        <div className="PostsUserPage">
          <Placeholder text={app.translator.trans('core.forum.user.posts_empty_text')} />
        </div>
      );
    }

    let footer;

    if (this.loading) {
      footer = <LoadingIndicator />;
    } else if (this.moreResults) {
      footer = (
        <div className="PostsUserPage-loadMore">
          <Button className="Button" onclick={this.loadMore.bind(this)}>
            {app.translator.trans('core.forum.user.posts_load_more_button')}
          </Button>
        </div>
      );
    }

    return (
      <div className="PostsUserPage">
        <ul className="PostsUserPage-list">
          {this.posts.map((post) => {
            const discussion = post.discussion();
            if (discussion.numberOfProtectedTags() > 0) {
              if (discussion.isProtectedTagDisplayedForPostList()) {
                const tags = processProtectedTagsForPost(discussion.protectedPasswordTags().concat(discussion.protectedGroupPermissionTags()));

                const isProtectedPasswordTags = discussion.protectedPasswordTags().length > 0;
                const isProtectedGroupPermissionTags = discussion.protectedGroupPermissionTags().length > 0;
                return <li>{provideTooltip(discussion, isProtectedPasswordTags, isProtectedGroupPermissionTags, tags)}</li>;
              } else {
                return <></>;
              }
            } else {
              return (
                <li>
                  <div className="PostsUserPage-discussion">
                    {app.translator.trans('core.forum.user.in_discussion_text', {
                      discussion: <Link href={app.route.post(post)}>{discussion.title()}</Link>,
                    })}
                  </div>

                  <CommentPost post={post} />
                </li>
              );
            }
          })}
        </ul>
        <div className="PostsUserPage-loadMore">{footer}</div>
      </div>
    );
  }
  override(PostsUserPage.prototype, 'content', extendPostsUserPageContent);
}
