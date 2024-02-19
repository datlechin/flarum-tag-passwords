<?php

namespace Datlechin\TagPasswords\Api\Controller;

use Exception;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Flarum\Tags\TagRepository;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\EmptyResponse;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Flarum\Tags\Api\Serializer\TagSerializer;
use Flarum\User\User;
use Flarum\Group\Group;
class AuthController extends AbstractCreateController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = TagSerializer::class;

    /**
     * @var TagRepository $tags
     */
    protected TagRepository $tags;

    public function __construct(TagRepository $tags)
    {
        $this->tags = $tags;
    }

    /**
     * {@inheritdoc}
     * @throws Exception
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $data = Arr::get($request->getParsedBody(), 'data', []);

        $tag = $this->tags->findOrFail($data['id'], $actor);

        if ($tag->password && $tag->password !== $data['password']) {
            throw new Exception('Password is incorrect');
        }
        if ($tag->protected_group_ids) {
            if (!$this->hasGroup($actor, explode(",",$tag->protected_group_ids))) {
                throw new Exception('Access Denied for Tag Access "'.$tag->name.'".');
            }
        }
        if (!$actor->isGuest()) {
            $state = $tag->stateFor($actor);
            $state->is_unlocked = true;
            $state->save();
        }
    }

    /**
    * Check whether the user has a permission that is based on their groups.
    */
    public function hasGroup(User $actor, Array $matches): bool
    {
       foreach ($actor->groups as $id=>$permissionGroup) {
            foreach ($matches as &$match) {
                if ($permissionGroup->id === (int)$match) {
                    return true;
                }
            }
       }

       return false;
    }
}