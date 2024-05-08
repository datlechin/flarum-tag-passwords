import CommentPost from 'flarum/forum/components/CommentPost';
import ComposerPostPreview from 'flarum/forum/components/ComposerPostPreview';
import listItems from 'flarum/common/helpers/listItems';

export default class TagProtectedCommentPost extends CommentPost {
  content() {
    const post = this.attrs.post;
    const discussion = this.attrs.post.discussion();
    const tags = this.attrs.post.discussion().tags();
    return [
      <header className="Post-header">
        <ul>{listItems(this.headerItems().toArray())}</ul>
      </header>,
      <div className="Post-body">
        {this.isEditing() ? <ComposerPostPreview className="Post-preview" composer={app.composer} /> : m.trust(this.attrs.post.contentHtml())}
      </div>,
    ];
  }
}