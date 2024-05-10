import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';
import type Mithril from 'mithril';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import Discussion from 'flarum/common/models/Discussion';
import Post from 'flarum/common/models/Post';
import ItemList from 'flarum/common/utils/ItemList';
import TagProtectedDiscussionHero from './components/TagProtectedDiscussionHero';
import DiscussionHero from 'flarum/forum/components/DiscussionHero';
import PostStreamState from 'flarum/forum/states/PostStreamState';
import { ApiResponseSingle } from 'flarum/common/Store';

export default function () {
  function extendDiscussionPageLoad() {
    const preloadedDiscussion = app.preloadedApiDocument<Discussion>();
    if (preloadedDiscussion) {
      // We must wrap this in a setTimeout because if we are mounting this
      // component for the first time on page load, then any calls to m.redraw
      // will be ineffective and thus any configs (scroll code) will be run
      // before stuff is drawn to the page.
      setTimeout(show.bind(this, preloadedDiscussion), 0);
    } else {
      const params = this.requestParams();

      app.store.find<Discussion>('discussions', m.route.param('id'), params).then(
        show.bind(this)
      );
    }
    m.redraw();
  }

  /**
   * List of items rendered as the main page content.
   */
  function extendDiscussionPagePageContent(): ItemList<Mithril.Children> {
    const items = new ItemList<Mithril.Children>();
    items.add('hero', this.hero(), 100);
    if (this.discussion.isProtectedTagDisplayedForDiscussionPage()) {
      items.add('main', <div className="container">{this.mainContent().toArray()}</div>, 10);
    }
    return items;
  }

  /**
   * Initialize the component to display the given discussion.
   */
  function show(discussion: ApiResponseSingle<Discussion>): void {
    app.setTitleCount(0);
    if(discussion.isProtectedTagDisplayedForDiscussionPage()) {
      app.history.push('discussion', discussion.title());
      app.setTitle(discussion.title());
      // When the API responds with a discussion, it will also include a number of
      // posts. Some of these posts are included because they are on the first
      // page of posts we want to display (determined by the `near` parameter) –
      // others may be included because due to other relationships introduced by
      // extensions. We need to distinguish the two so we don't end up displaying
      // the wrong posts. We do so by filtering out the posts that don't have
      // the 'discussion' relationship linked, then sorting and splicing.
      let includedPosts: Post[] = [];
      if (discussion.payload && discussion.payload.included) {
        const discussionId = discussion.id();

        includedPosts = discussion.payload.included
          .filter(
            (record) =>
              record.type === 'posts' &&
              record.relationships &&
              record.relationships.discussion &&
              !Array.isArray(record.relationships.discussion.data) &&
              record.relationships.discussion.data.id === discussionId
          )
          // We can make this assertion because posts should be in the store,
          // since they were in the discussion's payload.
          .map((record) => app.store.getById<Post>('posts', record.id) as Post)
          .sort((a: Post, b: Post) => a.number() - b.number())
          .slice(0, 20);
      }

      // Set up the post stream for this discussion, along with the first page of
      // posts we want to display. Tell the stream to scroll down and highlight
      // the specific post that was routed to.
      this.stream = new PostStreamState(discussion, includedPosts);
      const rawNearParam = m.route.param('near');
      const nearParam = rawNearParam === 'reply' ? 'reply' : parseInt(rawNearParam);
      this.stream.goToNumber(nearParam || (includedPosts[0]?.number() ?? 0), true).then(() => {
        this.discussion = discussion;

        app.current.set('discussion', discussion);
        app.current.set('stream', this.stream);
      });
    } else {
      app.history.push('discussion', "test");
      app.setTitle("test");
      this.stream = new PostStreamState(discussion, []);
      const rawNearParam = m.route.param('near');
      const nearParam = rawNearParam === 'reply' ? 'reply' : parseInt(rawNearParam);
      this.stream.goToNumber(nearParam || 0, true).then(() => {
        this.discussion = discussion;

        app.current.set('discussion', discussion);
        app.current.set('stream', this.stream);
      });
    }
  }

  override(DiscussionPage.prototype, 'pageContent', extendDiscussionPagePageContent);

  override(DiscussionPage.prototype, 'hero', function () {
    if (this.discussion.isProtectedTagDisplayedForDiscussionPage()) {
      return <DiscussionHero discussion={this.discussion} />;
    } else {
      return <TagProtectedDiscussionHero discussion={this.discussion} />;
    }
  });

  override(DiscussionPage.prototype, 'load', extendDiscussionPageLoad);
};