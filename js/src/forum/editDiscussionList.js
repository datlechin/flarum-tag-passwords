import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import classList from 'flarum/common/utils/classList';
import DiscussionList from 'flarum/forum/components/DiscussionList';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import TagProtectedDiscussionListItem from './components/TagProtectedDiscussionListItem';

export default function () {
  function processDiscussionListItem(discussion, pageNum, pageSize, itemNum, params) {
    if (discussion.numberOfProtectedTags() > 0) {
      return <li key={0} data-id={0} role="article" aria-setsize="-1" aria-posinset={pageNum * pageSize + itemNum}>
        <TagProtectedDiscussionListItem discussion={discussion} params={params} />
      </li>
    } else {
      return <li key={discussion.id()} data-id={discussion.id()} role="article" aria-setsize="-1" aria-posinset={pageNum * pageSize + itemNum}>
        <DiscussionListItem discussion={discussion} params={params} />
      </li>
    }
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
            return pg.items.map((discussion, itemNum) => (
              processDiscussionListItem(discussion, pageNum, pageSize, itemNum, params)
            ));
          })}
        </ul>
        <div className="DiscussionList-loadMore">{loading}</div>
      </div>
    );
  }

  override(DiscussionList.prototype, 'view', extendDiscussionListView);
};