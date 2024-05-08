import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Tag from 'flarum/tags/models/Tag';
import Link from 'flarum/common/components/Link';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import PostsUserPage from 'flarum/forum/components/PostsUserPage';
import CommentPost from 'flarum/forum/components/CommentPost';
import TagProtectedCommentPost from './components/TagProtectedCommentPost';
import tagsLabel from '../common/helpers/tagsLabel';
import ProtectedTag from '../common/models/ProtectedTag';

export default function () {
  function processProtectedTagsForPost(protectedTags,) {
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

                return (
                  <li>
                    <div className="PostsUserPage-discussion">{tagsLabel(tags, {}, true, false)}
                      {app.translator.trans('core.forum.user.in_discussion_text', {
                        discussion: <Link href='#'></Link>,
                      })}
                    </div>
      
                    <TagProtectedCommentPost post={post} />
                  </li>
                )
              } else {
                return <></>
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
              )
            }
        })}
        </ul>
        <div className="PostsUserPage-loadMore">{footer}</div>
      </div>
    );
  }
  override(PostsUserPage.prototype, 'content', extendPostsUserPageContent);
};