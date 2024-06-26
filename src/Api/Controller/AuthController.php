<?php

namespace Datlechin\TagPasswords\Api\Controller;

use Exception;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Flarum\Tags\Api\Serializer\TagSerializer;
use Flarum\Tags\TagRepository;
use Flarum\User\User;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class AuthController extends AbstractCreateController
{
    public $serializer = TagSerializer::class;

    public function __construct(protected TagRepository $tags) {}

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $data = Arr::get($request->getParsedBody(), 'data', []);

        $tag = $this->tags->findOrFail($data['id'], $actor);

        if ($tag->password && $tag->password !== $data['password']) {
            throw new Exception('Password is incorrect');
        }

        if ($tag->protected_groups) {
            if (! $this->hasGroup($actor, json_decode($tag->protected_groups))) {
                throw new Exception('Access Denied for Tag Access "' . $tag->name . '".');
            }
        }

        if (! $actor->isGuest()) {
            $state = $tag->stateFor($actor);
            $state->is_unlocked = true;
            $state->save();
        }
    }

    /**
     * Check whether the user has a permission that is based on their groups.
     */
    public function hasGroup(User $actor, array $protectedGroups): bool
    {
        foreach ($actor->groups as $group) {
            foreach ($protectedGroups as &$protectedGroup) {
                if ($group->id == $protectedGroup->id) {
                    return true;
                }
            }
        }

        return false;
    }
}
